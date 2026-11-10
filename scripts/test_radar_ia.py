import importlib.util
import json
import unittest
from datetime import datetime, timezone, timedelta
from pathlib import Path

spec = importlib.util.spec_from_file_location('radar', Path(__file__).with_name('coletar_radar_ia.py'))
radar = importlib.util.module_from_spec(spec)
spec.loader.exec_module(radar)
NOW = datetime(2026, 10, 31, 15, tzinfo=timezone.utc)
SOURCES = json.loads(radar.CONFIG.read_text())
OPENAI = SOURCES[0]
KIMI = next(source for source in SOURCES if source['id'] == 'kimi')

class RadarTests(unittest.TestCase):
    def test_exact_official_hosts_and_paths(self):
        for url in ['https://openai.com.evil.example/index/fake', 'http://openai.com/index/fake', 'https://openai.com@evil.example/index/fake', 'https://openai.com:8080/index/fake', 'https://evil.example/']:
            self.assertIsNone(radar.canonical_url(OPENAI, url))
        self.assertEqual(radar.canonical_url(OPENAI, 'https://openai.com/index/test?utm_source=spam'), 'https://openai.com/index/test')

    def test_missing_future_old_dates_are_not_published(self):
        for date in [None, 'not a date', (NOW + timedelta(days=1)).isoformat(), (NOW - timedelta(days=50)).isoformat()]:
            self.assertIsNone(radar.make_item(OPENAI, 'A new model', 'Official announcement', 'https://openai.com/index/model', date, NOW))

    def test_feed_is_deduplicated_and_html_is_not_injected(self):
        xml = b'<rss version="2.0"><channel><item><title>New AI model</title><link>https://openai.com/index/new-model</link><pubDate>Fri, 30 Oct 2026 09:00:00 GMT</pubDate><description>&lt;script&gt;alert(1)&lt;/script&gt;&lt;p&gt;An official announcement.&lt;/p&gt;</description></item></channel></rss>'
        items = radar.parse_feed(OPENAI, xml, NOW)
        self.assertEqual(len(items), 1)
        self.assertNotIn('<', items[0]['summary'])
        health = dict(id='openai', nome='OpenAI', status='ok', item_count=1)
        result = radar.assemble(SOURCES, [(items + items, health)], {}, NOW)
        self.assertEqual(len(result['items']), 1)
        self.assertEqual(result['items'][0]['id'], result['items'][0]['url'])

    def test_navigation_cannot_borrow_date_from_nearby_card(self):
        html = '''<nav><a href="/en/blog/old-model">Old Model</a><a href="/en/blog/other-model">Other Model</a></nav>
        <main><a href="/en/blog/new-model"><h3>New Model</h3><time>2026-10-30</time></a>
        <a href="/en/blog/old-model"><h3>Old Model</h3><time>2025-10-30</time></a></main>'''
        items = radar.parse_cards(KIMI, html, NOW)
        self.assertEqual([(item['title'], item['url']) for item in items], [('New Model', 'https://www.kimi.com/en/blog/new-model')])

    def test_total_source_failure_preserves_verified_news(self):
        item = radar.make_item(OPENAI, 'New model launch', 'Official update', 'https://openai.com/index/model', '2026-10-30', NOW)
        old = {'items': [item], 'last_successful_at': '2026-10-30T12:00:00+00:00'}
        result = radar.assemble(SOURCES, [([], {'id': 'openai', 'status': 'error'})], old, NOW)
        self.assertEqual(result['items'][0]['url'], item['url'])
        self.assertEqual(result['last_successful_at'], old['last_successful_at'])
        self.assertEqual(result['sources'][0]['status'], 'error')

    def test_company_limit_and_feature_are_based_on_real_items(self):
        items = [radar.make_item(OPENAI, f'New model {i}', 'New research model', f'https://openai.com/index/model-{i}', '2026-10-30', NOW) for i in range(15)]
        result = radar.assemble(SOURCES, [(items, {'id': 'openai', 'status': 'ok'})], {}, NOW)
        self.assertEqual(len(result['items']), 10)
        self.assertIn(result['featured_id'], [item['id'] for item in result['items']])

if __name__ == '__main__':
    unittest.main()
