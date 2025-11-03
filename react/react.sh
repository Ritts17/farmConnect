if [ -d "/home/coder/project/workspace/reactapp/src/tests/" ]
    then
        rm -r /home/coder/project/workspace/reactapp/src/tests;
fi
cp -r /home/coder/project/workspace/react/tests /home/coder/project/workspace/reactapp/src/;
cd /home/coder/project/workspace/reactapp/;
source /usr/local/nvm/nvm.sh
nvm use 16
export CI=true;
if [ -d "/home/coder/project/workspace/reactapp/node_modules" ]; then
    cd /home/coder/project/workspace/reactapp/
    npx jest --verbose --testPathPattern=src/tests 2>&1;
else
    cd /home/coder/project/workspace/reactapp/
    yes | npm install
    npx jest --verbose --testPathPattern=src/tests 2>&1;
fi