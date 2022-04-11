# node mutation.js 10 // get 10 mutations

cp ../checkbox.io-micro-preview/marqdown.js marqdown.js

cd ../checkbox.io-micro-preview
forever start index.js
sleep 5s

cd ../testing
node screenshot.js http://localhost:3000/survey/upload.md snapshot_orig

cd ../checkbox.io-micro-preview
forever stop index.js

# TO DO: add all URLS in the checkpoint app here to test
# for item in [LIST]
# do
#   [COMMANDS]
# done

for ((i = 1 ; i <= $1 ; i++)) do

cd ../testing
cp mutations/mutation$i.js ../checkbox.io-micro-preview/marqdown.js

cd ../checkbox.io-micro-preview
forever start index.js
sleep 5s

cd ../testing
node screenshot.js http://localhost:3000/survey/upload.md snapshot_$i

cd ../checkbox.io-micro-preview
forever stop index.js

done

cd ../testing
cp marqdown.js ../checkbox.io-micro-preview/marqdown.js
