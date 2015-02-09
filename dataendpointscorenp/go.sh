
##
##removes locations that have no dropoffs/pickups
##

for f in `ls out_hour??.txt`
do
    cat $f |grep -v ,0,0, > ${f}.s.csv
done
