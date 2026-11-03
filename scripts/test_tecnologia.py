"""Verifica conteúdo externo e continuidade dos cards sem depender da rede."""
import json
import unittest
from datetime import datetime, timedelta, timezone

from coletar_radar_ia import make_item, parse_feed
from coletar_tecnologia import CONFIG, assemble_cards, eligible


class TechnologyTests(unittest.TestCase):
    def setUp(self):
        self.sources = json.loads(CONFIG.read_text())
        self.mit, self.ieee, self.hf = self.sources
        self.now = datetime(2026, 11, 2, 12, tzinfo=timezone.utc)

    def item(self, source=None, **overrides):
        source = source or self.mit
        fields = dict(title='New electronic circuit uses less energy', summary='<p>Test summary</p>',
                      url='https://news.mit.edu/2026/electronic-circuit-1101', published='2026-11-01T10:00:00Z')
        fields.update(overrides)
        return make_item(source, now=self.now, **fields)

    def test_only_relevant_editorial_links(self):
        self.assertTrue(eligible(self.mit, self.item()))
        self.assertFalse(eligible(self.mit, self.item(title='Campus celebrates its anniversary')))
        editorial = self.item(self.hf, title='Welcome a new language model', url='https://huggingface.co/blog/new-model')
        self.assertTrue(eligible(self.hf, editorial))
        community = {**editorial, 'url': 'https://huggingface.co/blog/unknown-author/new-model'}
        self.assertFalse(eligible(self.hf, community))

    def test_rss_strips_html_and_rejects_invalid_dates_and_hosts(self):
        xml = '''<rss version="2.0"><channel><title>Test</title><item>
          <title>&lt;b&gt;New electronic circuit&lt;/b&gt;</title>
          <link>https://news.mit.edu/2026/circuit-1101?utm_source=rss</link>
          <pubDate>Sun, 01 Nov 2026 10:00:00 GMT</pubDate></item></channel></rss>'''
        items = parse_feed(self.mit, xml, self.now)
        self.assertEqual(items[0]['title'], 'New electronic circuit')
        self.assertEqual(items[0]['url'], 'https://news.mit.edu/2026/circuit-1101')
        for overrides in [dict(published=''), dict(published='2026-11-03'), dict(published='2026-01-01'),
                          dict(url='javascript:alert(1)'), dict(url='https://news.mit.edu.evil.test/2026/circuit'),
                          dict(url='https://user:pass@news.mit.edu/2026/circuit')]:
            self.assertIsNone(self.item(**overrides))

    def test_failure_keeps_previous_verification_and_expires_old_items(self):
        old = self.item()
        old['verified_at'] = '2026-11-01T12:00:00+00:00'
        previous = dict(items=[old], last_successful_at=old['verified_at'])
        health = dict(id=self.mit['id'], status='error', item_count=0)
        data = assemble_cards(self.sources, [([], health)], previous, self.now)
        self.assertEqual(len(data['items']), 1)
        self.assertEqual(data['items'][0]['verified_at'], old['verified_at'])
        self.assertEqual(data['last_successful_at'], previous['last_successful_at'])
        self.assertEqual(data['items'][0]['summary'], '')
        expired = assemble_cards(self.sources, [([], health)], previous, self.now + timedelta(days=46))
        self.assertEqual(expired['items'], [])

    def test_deduplicates_and_keeps_all_three_topics(self):
        results = []
        for source in self.sources:
            url = source['site'].rstrip('/') + '/new-chip-model'
            if source == self.mit:
                url = 'https://news.mit.edu/2026/new-electronic-chip-1101'
            elif source == self.hf:
                url = 'https://huggingface.co/blog/new-language-model'
            item = self.item(source, title='New electronic chip and language model', url=url)
            results.append(([item, item], dict(id=source['id'], status='ok', item_count=2)))
        data = assemble_cards(self.sources, results, {}, self.now)
        self.assertEqual(len(data['items']), 3)
        self.assertEqual({item['tema'] for item in data['items']}, {'Eletrônica', 'Chips', 'LLMs'})


if __name__ == '__main__':
    unittest.main()
