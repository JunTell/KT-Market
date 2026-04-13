OrderSummaryCard.tsx + 신청서 필독사항 내용 => line-height: 1.4 
```
<요금제>
: PlanBenefitSelector.tsx
요금제 이름 => font-size: 17px
서브 설명 (데이터, 공유 데이터..) => font-size: 13px  /  font-weight: 500? (지금 조금 얇아요!)
nn만원 할인 => font-weight: 600 (지금 조금 얇아요!)
금액 => font-size: 18px
가장 하단에 6개월 유지 안내 내용 부분 => font-size: 12px
요금제들(덩어리) => gap: 10px

할인 제품 안내 => font-size: 13px
할인제품 이미지 => width:54px  /  height:54px
할인 제품 이름 => font-size: 12px
할인 제춤 금액 => font-size: 13px
할부 수수료 별도 => 금액 옆으로 옮겨주세요
이름과 금액 사이 => gap: 8px
박스? => width: calc(65% - 4px)  -> 할인 제품 이름이 안 끊기게 해주세요
할인 제품 선택되는 거 수정해주세요
6개월간 유지 안내 문구
=> 초이스 유의사항이 ?버튼으로 불가 -> 소제목 밑에
=> 초이스 유의사항이 ?버튼으로 가능 -> 맨 하단에 (직접 선택 밑)

```
 
```
<단말기>
: InstallmentSelectorSection.tsx
전체 버튼 => padding: 줄여야하는데.... 뜨지 않아요...
위아래 패딩 값 줄이고, +버튼과 -버튼은 정사각형 모양으로 해주세요
+와 - 사이즈 더 크게 해주세요
```
```
<최종 주문서>:
OrderSummarySheet.tsx
틀 하나로 합쳐주세요
할부이자 표시 => font-size: 15px
분할 상환 수수료 5.9% 포함 => gap: 0px
월할부금과 출고가 사이, 월 통신요금과 요금제 이름 사이 => 간격 띄워주세요 
상세 내용 (ex. 단말할인, KT지원금) => padding-bottom: 5px (gap?)  /  font-weight:500
점선 => 덜 촘촘하게 줄여주세요.. 
월할부금과 월 통신요금, 예상 금액 사이 실선 추가 => 두께: 1.5px  /  컬러 => #A8B2BF
월 예상금액 문구 =>  font-size: 17px
월 예상금액 금액 => font-size: 21px
```
```
<신청하기>: 
버튼 밑에 절차 넣어주세요

```
```
<고정 바>
: OrderFlowBottomSheet.tsx
전체 버튼 => height: 45px (전화 버튼은 양옆도 맞춰주세요)  /  font-size: 18px
전화 아이콘 => width: 25px  /  height: 25px
월 예상금액 문구 => font-size: 15px  /  font-weight:600
부가세, 할부이자 안내 문구 => font-size: 12px  /  font-weight:500
월 예상금액 금액 => font-size: 21px
```