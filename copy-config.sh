heroku config -s --remote $1 > .env
source .env
export $(cut -d= -f1 .env)