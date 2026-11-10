import unittest
from datetime import datetime,timezone
from coletar_business import canonical_url,candidate,assemble

class BusinessCollectionTests(unittest.TestCase):
    def setUp(self):
        self.source=dict(id='instituto',hosts=['research.example.org'])
        self.now=datetime(2026,11,6,12,tzinfo=timezone.utc)
        self.entry=dict(title='Customer research and marketing strategy',link='https://research.example.org/marketing?utm_source=rss',published_parsed=(2026,11,5,10,0,0,0,0,0))
    def test_only_institution_hosts(self):
        for url in ['http://research.example.org/x','https://research.example.org.evil.test/x','https://user:pass@research.example.org/x','https://research.example.org:8080/x','javascript:alert(1)']:
            self.assertIsNone(canonical_url(self.source,url))
    def test_canonical_and_candidates_only(self):
        item=candidate(self.source,self.entry,self.now)
        self.assertEqual(item['url'],'https://research.example.org/marketing')
        self.assertEqual(item['status'],'candidato');self.assertFalse(item['revisao_editorial'])
    def test_rejects_promotion_and_unrelated(self):
        for title in ['Guaranteed results in marketing coaching','Campus concert and alumni dinner']:
            self.assertIsNone(candidate(self.source,{**self.entry,'title':title},self.now))
    def test_rejects_missing_old_and_future_dates(self):
        for value in [None,(2025,1,1,0,0,0,0,0,0),(2027,1,1,0,0,0,0,0,0)]:
            self.assertIsNone(candidate(self.source,{**self.entry,'published_parsed':value},self.now))
    def test_failure_preserves_previous_without_promoting_it(self):
        item=candidate(self.source,self.entry,self.now)
        data=assemble([self.source],[([], 'HTTPError')],dict(itens=[item]),self.now)
        self.assertEqual(data['itens'],[item]);self.assertEqual(data['fontes'][0]['status'],'erro')
    def test_deduplication_and_unapproved_sources(self):
        item=candidate(self.source,self.entry,self.now)
        data=assemble([self.source],[([item,item],None)],{},self.now)
        self.assertEqual(len(data['itens']),1)
        self.assertEqual(assemble([],[],dict(itens=[item]),self.now)['itens'],[])

if __name__ == '__main__': unittest.main()
