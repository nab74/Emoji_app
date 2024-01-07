import { User, clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { privateProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {id: user.id, username: user.username, profileImageUrl:user.profileImageUrl}
};

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async({ ctx }) => {
    const posts = await ctx.db.post.findMany({ 
      take:100,
    }); 
    const users =(await clerkClient.users.getUserList({
      userId: posts.map((post)=>post.autherId),
      limit: 100,
    })).map(filterUserForClient);

    console.log(users);

    return posts.map(post=>{
      const author=users.find((user)=>user.id===post.autherId);

      if(!author)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found",
      });

    console.log(author.username);

      return{
        post,
        author: {
          ...author,
          username: author.username,
        },
       };   
    });
  }),

  create: privateProcedure.input(z.object({content: z.string().emoji().min(1).max(280)}))
  .mutation(async({ctx,input})=>{
    const autherId =ctx.userId;

    const post=await ctx.db.post.create({
      data: {
       autherId,
        content: input.content,
      },
    });
    return post;
  }),
});