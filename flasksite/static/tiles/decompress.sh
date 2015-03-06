

for p in `ls -1 *.tar.gz`; do
    echo "checking $p"
    if [ ! -e "./`basename $p .tar.gz`" ]; then
	echo "decompressing..."
	tar zxf $p
    else
	echo "already decompressed!"
    fi
done

