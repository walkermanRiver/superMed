echo "POST Add new case record1"
echo
curl -s -X POST \
  http://localhost:4000/case \
  -H "content-type: application/json" \
  -d '{
	"args": ["1110103200007123333","FDSFDSFT", "1110103200007123333", "ZS", "33", "20180125","Internal Medicine","Xu","xxx痛xxxxx"]
}'
echo
echo

echo "POST Add new case record2"
echo
curl -s -X POST \
  http://localhost:4000/case \
  -H "content-type: application/json" \
  -d '{
	"args": ["1110103200007123333","FDSFDSFT", "1110103200007123333", "ZS", "33", "20180125","Internal Medicine","Xu","xxx痛2xxxxx"]
}'
echo
echo

echo "POST Add new case record2"
echo
curl -s -X POST \
  http://localhost:4000/case \
  -H "content-type: application/json" \
  -d '{
	"args": ["1110103200007123333","FDSFDSFT", "1110103200007123333", "ZS", "33", "20180125","Internal Medicine","Xu","xxx痛3xxxxx"]
}'
echo
echo