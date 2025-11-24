import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { 
  createContentPost, getUserContentPosts, updateContentPost, deleteContentPost, 
  createContentTemplate, getUserContentTemplates, deleteContentTemplate, 
  getUserSubscription, createOrUpdateSubscription,
  createPaymentRequest, getUserPaymentRequests, updatePaymentRequest, getAllPendingPaymentRequests
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  content: router({
    list: protectedProcedure
      .input(z.object({ month: z.date().optional() }).optional())
      .query(({ ctx, input }) => getUserContentPosts(ctx.user.id, input?.month)),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        platforms: z.string(),
        scheduledAt: z.date().optional(),
        templateId: z.number().optional(),
      }))
      .mutation(({ ctx, input }) => createContentPost({
        userId: ctx.user.id,
        ...input,
        status: "draft",
      })),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        platforms: z.string().optional(),
        scheduledAt: z.date().optional(),
        status: z.enum(["draft", "scheduled", "published", "failed"]).optional(),
      }))
      .mutation(({ input }) => updateContentPost(input.id, input)),
    
    delete: protectedProcedure
      .input(z.number())
      .mutation(({ input }) => deleteContentPost(input)),
  }),
  
  templates: router({
    list: protectedProcedure
      .query(({ ctx }) => getUserContentTemplates(ctx.user.id)),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        content: z.string().min(1),
        category: z.string().optional(),
        platforms: z.string(),
      }))
      .mutation(({ ctx, input }) => createContentTemplate({
        userId: ctx.user.id,
        ...input,
      })),
    
    delete: protectedProcedure
      .input(z.number())
      .mutation(({ input }) => deleteContentTemplate(input)),
  }),
  
  subscription: router({
    current: protectedProcedure
      .query(({ ctx }) => getUserSubscription(ctx.user.id)),
    
    update: protectedProcedure
      .input(z.object({
        plan: z.enum(["free", "pro", "business"]),
        status: z.enum(["active", "canceled", "pending"]).optional(),
        currentPeriodStart: z.date().optional(),
        currentPeriodEnd: z.date().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const subData = { ...input } as any;
        return createOrUpdateSubscription(ctx.user.id, subData);
      }),
  }),

  payment: router({
    requestUpgrade: protectedProcedure
      .input(z.object({
        plan: z.enum(["pro", "business"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const planPrices: Record<string, string> = {
          pro: "19.00",
          business: "49.00",
        };

        return createPaymentRequest({
          userId: ctx.user.id,
          plan: input.plan,
          amount: planPrices[input.plan],
          currency: "USD",
          status: "pending",
        });
      }),

    getRequests: protectedProcedure
      .query(({ ctx }) => getUserPaymentRequests(ctx.user.id)),

    updateRequest: protectedProcedure
      .input(z.object({
        id: z.number(),
        paymentProof: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => updatePaymentRequest(input.id, {
        paymentProof: input.paymentProof,
        notes: input.notes,
      })),

    // Admin endpoint to approve/reject payments
    adminApprove: protectedProcedure
      .input(z.object({
        paymentId: z.number(),
        approved: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }

        const payment = await updatePaymentRequest(input.paymentId, {
          status: input.approved ? "approved" : "rejected",
          approvedAt: input.approved ? new Date() : undefined,
        });

        // If approved, update subscription
        if (input.approved) {
          const paymentData = await updatePaymentRequest(input.paymentId, {});
          // Update user's subscription
          await createOrUpdateSubscription((await updatePaymentRequest(input.paymentId, {})) as any, {
            plan: (await updatePaymentRequest(input.paymentId, {})) as any,
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });
        }

        return payment;
      }),

    adminGetPending: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return getAllPendingPaymentRequests();
      }),
  }),
});

export type AppRouter = typeof appRouter;
