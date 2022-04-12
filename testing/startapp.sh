
cd testing
cp mutations/mutation$1.js ../$2/marqdown.js

echo "starting forever for mutation"
cd ../$2
forever start index.js
sleep 5s