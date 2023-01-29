cd backend
echo "Building Backend ..."
go build
echo "Done"

cd ../frontend
./serve.sh
