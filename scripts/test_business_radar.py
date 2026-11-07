import unittest
from datetime import datetime,timezone
from coletar_business_radar import assemble_radar
from coletar_business_livros import candidates
NOW=datetime(2026,11,7,tzinfo=timezone.utc)
SOURCE={'id':'hbr','hosts':['hbr.org'],'idioma':'en'}
ITEM={'id':'one','titulo':'Customer strategy and brand research','url':'https://hbr.org/research','data':'2026-11-01','summary':'Texto do feed que não deve ser republicado.'}
class Radar(unittest.TestCase):
 def test_publica_so_metadados_institucionais_sem_republicar_resumos(self):
  data=assemble_radar([SOURCE],[([ITEM],None)],{},NOW)
  self.assertEqual(len(data['items']),1);self.assertEqual(data['items'][0]['summary'],'')
  self.assertEqual(data['last_successful_at'],NOW.isoformat())
  self.assertNotIn('status',data['items'][0])
 def test_falha_preserva_lote_sem_alegar_sucesso_novo(self):
  old=assemble_radar([SOURCE],[([ITEM],None)],{},NOW)
  new=assemble_radar([SOURCE],[([], 'HTTPError')],old,NOW)
  self.assertEqual(new['items'],old['items']);self.assertEqual(new['sources'][0]['status'],'error')
  self.assertEqual(new['last_successful_at'],old['last_successful_at'])
 def test_bloqueia_host_spoof_coach_promocao_e_datas_invalidas(self):
  for patch in [{'url':'https://hbr.org.evil.test/x'},{'url':'https://user:pass@hbr.org/x'},{'titulo':'Marketing coaching guaranteed results'},{'titulo':'Marketing programme overview apply now'},{'data':'2028-01-01'},{'data':'2025-01-01'},{'data':'invalid'}]:
   self.assertEqual(assemble_radar([SOURCE],[([{**ITEM,**patch}],None)],{},NOW)['items'],[])
 def test_sem_fontes_ativas_nao_preserva_cache_suspenso(self):
  old=assemble_radar([SOURCE],[([ITEM],None)],{},NOW)
  self.assertEqual(assemble_radar([],[],old,NOW)['items'],[])
 def test_descoberta_livro_nao_publica_e_exige_editora_aprovada(self):
  item={'title':'Marketing Management','key':'/works/OL123W','publisher':['Pearson'],'author_name':['Autor']}
  data=candidates([item,item],{'editora-pearson'},set())
  self.assertEqual(len(data),1);self.assertEqual(data[0]['status'],'candidato');self.assertTrue(data[0]['confirmacao_editora_pendente'])
  self.assertEqual(candidates([item],set(),set()),[])
  self.assertEqual(candidates([item],{'editora-pearson'},{'marketing management'}),[])
if __name__=='__main__':unittest.main()
