
for i in 1 3 4 5 6 7 8 9 10 11 12
do
echo "doing $i"
head -n 1 clean_${i}.csv > clean_${i}_sorted.csv
tail -n +2 clean_${i}.csv |sort -k 1 -t ,  >> clean_${i}_sorted.csv
done
