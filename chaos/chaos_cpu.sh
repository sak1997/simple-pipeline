#!/bin/sh
# Script for CPU  Chaos

cat << EOF > /tmp/infiniteburn.sh
#!/bin/bash
while true;
    do openssl speed;
done
EOF

# Make executable
chmod +x /tmp/infiniteburn.sh

#Will cause a ton of chaos! 
for i in $(seq 1 32);
do
    nohup /bin/sh /tmp/infiniteburn.sh &
done

