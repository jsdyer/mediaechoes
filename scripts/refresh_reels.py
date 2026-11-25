"""Manually refresh a small editorial selection; no media downloads."""
import datetime,json,pathlib,subprocess,urllib.parse,tempfile
ROOT=pathlib.Path(__file__).resolve().parents[1]
def capture(config):
    records={}; checked=datetime.datetime.now(datetime.timezone.utc).isoformat()
    for group in config['collections']:
        if not isinstance(group['query'],str) or not group['query'].startswith('collection:prelinger AND mediatype:movies'): raise ValueError('Expected a bounded Prelinger film query')
        params=[('q','('+group['query']+') AND licenseurl:*'),('rows',str(min(12,max(1,config['perCollection'])))),('output','json'),('sort[]','downloads desc')]+[('fl[]',x) for x in ['identifier','title','year','creator','licenseurl','description']]
        url='https://archive.org/advancedsearch.php?'+urllib.parse.urlencode(params)
        raw=subprocess.run(['curl','--fail','--silent','--show-error','--max-time','40',url],capture_output=True,check=True).stdout
        data=json.loads(raw)
        if not isinstance(data.get('response',{}).get('docs'),list): raise ValueError('Invalid search response')
        for row in data['response']['docs']:
            license=row.get('licenseurl',''); license=license[0] if isinstance(license,list) and license else license
            if not isinstance(license,str) or not ('creativecommons.org/publicdomain/' in license or 'creativecommons.org/licenses/publicdomain' in license): continue
            identifier=row['identifier']
            if identifier in records:
                records[identifier]['groups'].append(group['id']); continue
            records[identifier]={'id':identifier,'title':row.get('title',identifier),'year':str(row.get('year','')),'creator':row.get('creator',''),'rightsUrl':license.replace('http://','https://'),'rightsLabel':'Public-domain designation recorded by Internet Archive','groups':[group['id']],'source':'https://archive.org/details/'+urllib.parse.quote(identifier),'checkedAt':checked}
    if len(records)<4: raise ValueError('Too few rights-labelled films; preserving prior collection')
    return {'schema':'mediaechoes.reels.v1','checkedAt':checked,'records':list(records.values())}
if __name__=='__main__':
    result=capture(json.loads((ROOT/'web/reels-config.json').read_text()))
    target=ROOT/'web/data/reels.json'; temporary=target.with_suffix('.tmp'); temporary.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n'); temporary.replace(target)
    print('Saved',len(result['records']),'rights-labelled film records; no media downloaded.')
