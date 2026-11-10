import unittest
from datetime import datetime, timezone
from coletar_business_videos import parse_channel, assemble

NOW=datetime(2026,11,6,tzinfo=timezone.utc)
CHANNEL='UCWo4IA01TXzBeGJJKWHOG9g'
SOURCE={'id':'hbr','status':'aprovado','escopos':['videos']}
CHANNEL_DATA={'id':CHANNEL,'status':'aprovado'}

def feed(channel=CHANNEL,title='Research on customer strategy',video='abcdefghijk',date='2026-11-01T12:00:00Z',root_id=CHANNEL,author=CHANNEL):
    return f'''<feed xmlns="http://www.w3.org/2005/Atom" xmlns:yt="http://www.youtube.com/xml/schemas/2015"><yt:channelId>{root_id}</yt:channelId><author><uri>https://www.youtube.com/channel/{author}</uri></author><entry><yt:channelId>{channel}</yt:channelId><yt:videoId>{video}</yt:videoId><author><uri>https://www.youtube.com/channel/{author}</uri></author><title>{title}</title><published>{date}</published></entry></feed>'''.encode()

class Videos(unittest.TestCase):
    def test_only_candidates(self):
        items=parse_channel(feed(),SOURCE,CHANNEL_DATA,NOW)
        self.assertEqual(len(items),1)
        self.assertEqual(items[0]['status'],'candidato')
        self.assertFalse(items[0]['revisao_integral'])
    def test_channel_impersonation_excluded(self):
        self.assertEqual(parse_channel(feed(channel='UC0000000000000000000000'),SOURCE,CHANNEL_DATA,NOW),[])
        with self.assertRaises(ValueError):parse_channel(feed(),SOURCE,{'id':'UC0000000000000000000000'},NOW)
    def test_actual_youtube_root_without_uc_prefix(self):
        items=parse_channel(feed(root_id=CHANNEL[2:]),SOURCE,CHANNEL_DATA,NOW)
        self.assertEqual(len(items),1)
        self.assertEqual(items[0]['channel_id'],CHANNEL)
    def test_root_abbreviation_requires_matching_author(self):
        with self.assertRaises(ValueError):parse_channel(feed(root_id=CHANNEL[2:],author='UC0000000000000000000000'),SOURCE,CHANNEL_DATA,NOW)
    def test_promotions_dates_and_invalid_ids(self):
        for change in [dict(title='Marketing coaching guaranteed results'),dict(title='Making a Strategic Impact with INSEAD EMFin'),dict(title='Marketing programme overview — apply now'),dict(date='2028-01-01T12:00:00Z'),dict(date='2026-01-01T12:00:00Z'),dict(date='2026-11-01T12:00:00'),dict(video='../invalid')]:
            self.assertEqual(parse_channel(feed(**change),SOURCE,CHANNEL_DATA,NOW),[])
    def test_failed_source_preserves_candidate_but_never_review_status(self):
        item=parse_channel(feed(),SOURCE,CHANNEL_DATA,NOW)[0]
        result=assemble([(SOURCE,CHANNEL_DATA)],[([], 'HTTPError')],{'itens':[{**item,'revisao_integral':True,'revisao_editorial':True}]},NOW)
        self.assertEqual(len(result['itens']),1)
        self.assertFalse(result['itens'][0]['revisao_integral'])
        self.assertEqual(result['fontes'][0]['status'],'erro')
    def test_suspended_channel_has_no_preserved_queue(self):
        item=parse_channel(feed(),SOURCE,CHANNEL_DATA,NOW)[0]
        self.assertEqual(assemble([],[],{'itens':[item]},NOW)['itens'],[])

if __name__=='__main__':unittest.main()
