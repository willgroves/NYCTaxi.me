

for p in `ls -d1 */`; do tar zcf `basename $p`.tar.gz $p ; done

