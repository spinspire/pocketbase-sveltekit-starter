#!/bin/bash

set -e

remote=root@pocketbase01

echo "------ DEPLOYING to $remote ------"

cd backend
go build &

cd ../frontend
npm run build 

wait

cd ..
rsync -azP -e ssh backend/pocketbase $remote:~/pocketbase &
rsync -azP -e ssh backend/pb_migrations $remote:~/pocketbase/ &
rsync -azP -e ssh frontend/build $remote:~/pocketbase &

wait 

ssh $remote "systemctl restart pocketbase"

echo "---------------------"
echo "------ SUCCESS ------"
echo "---------------------"
