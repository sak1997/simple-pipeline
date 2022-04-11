
mkdir -p image_snapshots html_snapshots
cp ../checkbox.io-micro-preview/marqdown.js marqdown.js

#baseline screeshot
pm2 start checkbox.io-micro-preview/index.js 
node testing/screenshot.js $1 "orig_$2"
pm2 stop checkbox.io-micro-preview/index.js 

#fuzzing
node mutation.js $3

#screenshot
for ((i = 1 ; i <= $3 ; i++)) do

cp mutations/mutation$i.js ../checkbox.io-micro-preview/marqdown.js

pm2 start checkbox.io-micro-preview/index.js 
node testing/screenshot.js $1 "snap_$2$i"
pm2 stop checkbox.io-micro-preview/index.js

done
cp marqdown.js ../checkbox.io-micro-preview/marqdown.js
