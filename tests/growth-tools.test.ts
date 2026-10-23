import {it,expect} from 'vitest';
import {buildCampaignUrl} from '../apps/web/app/content/growth-tools';
it('builds a campaign link without retaining click identifiers or permitting credential destinations',()=>{
 const url=new URL(buildCampaignUrl('https://omni101.app/start-project?gclid=old&utm_source=old','Google','CPC','Autumn Launch'));
 expect(url.searchParams.get('gclid')).toBeNull();expect(url.searchParams.get('utm_campaign')).toBe('autumn_launch');
 const credentials=new URL('https://example.test');credentials.username='synthetic-test';credentials.password='synthetic-test';
 for(const target of ['http://example.test',credentials.toString(),'https://example.test?token=private'])expect(()=>buildCampaignUrl(target,'google','cpc','launch')).toThrow();
});
