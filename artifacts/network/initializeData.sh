echo "POST Add new case record1"
echo
curl -s -X POST \
  http://localhost:4000/case \
  -H "content-type: application/json" \
  -d '{
  	"args": [
      "0971236045", 
      "b61d3670-cdb7-5bfd-8301-472871f62d24", 
      "0971236045", 
      "曙光医院", 
      "0971236045", 
      "1540793046253", 
      "内科", 
      "陈夏", 
      "{\"mainSymptom\":[{\"key\":\"fr\",\"text\":\"发热\",\"value\":\"fr\"},{\"key\":\"tt\",\"text\":\"头痛\",\"value\":\"tt\"},{\"key\":\"bs\",\"text\":\"鼻塞\",\"value\":\"bs\"},{\"key\":\"lt\",\"text\":\"流涕\",\"value\":\"lt\"}],\"bodyTemperature\":\"37\",\"sBloodPressure\":\"90\",\"dBloodPressure\":\"111\",\"pulse\":\"80\",\"pastMedicalHis\":[{\"key\":\"gxb\",\"text\":\"冠心病\",\"value\":\"gxb\"}],\"diagnosis\":[{\"key\":\"yy\",\"text\":\"咽炎\",\"value\":\"yy\"}],\"opinion\":\"休息三天\"}"
    ]
  }'
echo
echo

echo "POST Add new case record2"
echo
curl -s -X POST \
  http://localhost:4000/case \
  -H "content-type: application/json" \
  -d '{
	 "args": [
      "0971236045", 
      "50a61ca1-bf39-c23a-4375-d3f2d3df134b", 
      "0971236045", 
      "仁济医院", 
      "0971236045", 
      "1540793325572", 
      "内科", 
      "张如意", 
      "{\"mainSymptom\":[{\"key\":\"bs\",\"text\":\"鼻塞\",\"value\":\"bs\"},{\"key\":\"ssy\",\"text\":\"声嘶哑\",\"value\":\"ssy\"},{\"key\":\"lt\",\"text\":\"流涕\",\"value\":\"lt\"}],\"bodyTemperature\":\"37\",\"sBloodPressure\":\"98\",\"dBloodPressure\":\"120\",\"pulse\":\"111\",\"pastMedicalHis\":[{\"key\":\"gxz\",\"text\":\"高血脂\",\"value\":\"gxz\"},{\"key\":\"jk\",\"text\":\"甲亢\",\"value\":\"jk\"}],\"allergies\":[{\"key\":\"bbbt\",\"text\":\"苯巴比妥\",\"value\":\"bbbt\"},{\"key\":\"plky\",\"text\":\"普鲁卡因\",\"value\":\"plky\"}],\"diagnosis\":[{\"key\":\"bdxgm\",\"text\":\"病毒性感冒\",\"value\":\"bdxgm\"}],\"opinion\":\"休息三天后复诊\"}"
    ]
  }'
echo
echo

echo "POST Add new case record2"
echo
curl -s -X POST \
  http://localhost:4000/case \
  -H "content-type: application/json" \
  -d '{
	 "args": [
      "1110103200007123333","FDSFDSFT", "1110103200007123333", "ZS", "33", "20180125","Internal Medicine","Xu","xxx痛3xxxxx"
    ]
  }'
echo
echo