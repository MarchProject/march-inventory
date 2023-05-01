rm -Rf node_modules
cp ../../pnpm-lock.yaml .
pnpm i .
pnpm prisma:gen
