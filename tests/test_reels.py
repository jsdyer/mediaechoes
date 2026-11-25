import json,pathlib,sys,unittest
from unittest.mock import patch
ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import refresh_reels
class ReelsTests(unittest.TestCase):
 def test_data_rights_and_config_coverage(self):
  config=json.loads((ROOT/'web/reels-config.json').read_text());data=json.loads((ROOT/'web/data/reels.json').read_text())
  for c in config['collections']:self.assertTrue(any(c['id'] in r['groups'] for r in data['records']))
  for r in data['records']:self.assertIn('creativecommons.org/',r['rightsUrl']);self.assertEqual(r['checkedAt'],data['checkedAt'])
 def test_missing_rights_cannot_become_public_reels(self):
  config={'perCollection':1,'collections':[{'id':'test','query':'collection:prelinger AND mediatype:movies'}]}
  class Result:stdout=json.dumps({'response':{'docs':[{'identifier':'unlicensed','title':'Unknown film'}]}}).encode()
  with patch('refresh_reels.subprocess.run',return_value=Result()):
   with self.assertRaises(ValueError):refresh_reels.capture(config)
if __name__=='__main__':unittest.main()
