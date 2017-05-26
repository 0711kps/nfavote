cd /home/[:usrname]/nfavote/log/
rm development.log
files_count=$(echo "`ls | wc -l`-2" |bc)
line_count=`head -n 10000 production.log | wc -l`
# 10000
while [[ $line_count -ge 10000  ]]
do
  let files_count+=1
  head production.log -n 10000 > logfile_`printf "%04d" $files_count`.log && sed -i '1,10000d' production.log
  line_count=`head -n 10000 production.log | wc -l`
done
# 10000
if [[ $files_count -ge 10000  ]]
then
  # 1000
  del_count=`expr $files_count - 1000`
  ls logfile* | head -n $del_count | while read file
  do
    rm -f $file
  done
  i=1
  ls logfile* | while read file
  do
    mv $file logfile_`printf "%04d" $i`.log
    let i+=1
  done
fi
