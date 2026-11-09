import test from 'node:test';
import assert from 'node:assert/strict';
import {questions} from '../src/api/mock/questions.js';
import {mockDiagnosis} from '../src/api/mock/diagnosis.js';
import {mockSchedule} from '../src/api/mock/schedule.js';
const safeAnswers=()=>questions.map(q=>({code:q.code,answer:q.risky==='YES'?'NO':'YES'}));
function input(overrides={}, changed={}) {
 return {deposit:20000,salePrice:30000,seniorDeposit:0,answers:safeAnswers().map(a=>({...a,answer:changed[a.code]??a.answer})),...overrides};
}
test('문서 데모 A/B/C 점수는 0/70/40',()=>{
 assert.equal(mockDiagnosis(input()).score,0);
 assert.equal(mockDiagnosis(input({deposit:24000,salePrice:28000,mortgageMax:3600},{T2_USAGE:'NO',A2_RECENT_OWNER:'YES',B1_MORTGAGE:'YES'})).score,70);
 assert.equal(mockDiagnosis(input({deposit:15000,salePrice:20000},{A3_TRUST:'YES'})).score,40);
});
test('부채비율 경계값은 표시 반올림 전에 판정',()=>{
 for(const [deposit,score]of [[6999,0],[7000,10],[7999,10],[8000,25],[8999,25],[9000,40]]){
 assert.equal(mockDiagnosis(input({deposit,salePrice:10000})).score,score);
 }
});
test('모르겠어요는 위험 답변으로 계산하고 근저당은 10점',()=>{
 assert.equal(mockDiagnosis(input({}, {B1_MORTGAGE:'UNKNOWN'})).score,10);
 assert.equal(mockDiagnosis(input({}, {T1_ADDRESS:'UNKNOWN'})).grade,'DANGER');
});
test('근저당 YES의 0점 안내를 유지하며 NO의 금액은 무시',()=>{
 const result=mockDiagnosis(input({mortgageMax:10},{B1_MORTGAGE:'YES'}));
 assert.equal(result.factors.at(-1).code,'B1_MORTGAGE');
 assert.equal(result.factors.at(-1).score,0);
 assert.equal(mockDiagnosis(input({mortgageMax:90000})).score,0);
});
test('선순위 보증금 null과 0을 구분',()=>{
 assert.equal(mockDiagnosis(input({seniorDeposit:null})).warnings.length,1);
 assert.equal(mockDiagnosis(input({seniorDeposit:0})).warnings.length,0);
});
test('일정 16개와 중요 일정 2개, 같은 날짜의 순서 유지',()=>{
 const result=mockSchedule({contractDate:'2026-11-20',balanceDate:'2026-12-20'});
 assert.equal(result.items.length,16);
 assert.deepEqual(result.items.filter(i=>i.important).map(i=>i.order),[9,11]);
 assert.equal(result.expiryDate,'2028-12-20');
 const sorted=[...result.items].sort((a,b)=>a.date.localeCompare(b.date)||a.order-b.order);
 assert.deepEqual(result.items,sorted);
 for(const item of result.items)assert.equal(item.status,item.daysLeft<0?'PAST':item.daysLeft>0?'UPCOMING':'TODAY');
});
test('윤년과 월말의 만기는 마지막 유효 날짜로 보정',()=>{
 assert.equal(mockSchedule({contractDate:'2024-02-01',balanceDate:'2024-02-29'}).expiryDate,'2026-02-28');
 assert.equal(mockSchedule({contractDate:'2026-01-01',balanceDate:'2026-01-31',termMonths:1}).expiryDate,'2026-02-28');
});
test('OCR Mock은 10개를 순서대로 주고 판독 못 한 답을 NO로 채우지 않음',async()=>{
 const {mockOcr}=await import('../src/api/mock/ocr.js');
 const result=mockOcr();
 assert.deepEqual(result.answers.map(a=>a.code),questions.map(q=>q.code));
 // 건축물대장은 필수라(D11) 위반건축물은 서류로 확인하고, docs/03 5번 예시처럼 2개만 남는다
 assert.deepEqual(result.answers.filter(a=>a.status==='UNCONFIRMED').map(a=>a.code),['A1_OWNER','B3_JEONSE_RIGHT']);
 for(const a of result.answers)assert.equal(a.answer===null,a.status==='UNCONFIRMED');
 assert.equal(result.answers.at(-1).answer,'NO');
 assert.equal(result.warnings.length,0);
});
