import { withClerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse} from "next/server";

export default withClerkMiddleware(()=>{
   // console.log("middleware running");
    return  NextResponse.next();
});

export const config = {
    marcher: "/((?!_next/image|_next/static|favicon.ico).*)",
};
