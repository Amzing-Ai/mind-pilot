# My Create Options

<img src="./public/images/create-options.png" />


## Start app
假设你本地已经启动了数据库那么请你修改env中的配置问题
```typescript
DATABASE_URL="mysql://root:123456@localhost:3307/next-t3-app"
```
然后即可使用脚本同步prisma schema到数据库，完成库的创建和启动项目
```bash
pnpm install
pnpm db:push
pnpm dev
```



## About T3 app

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
