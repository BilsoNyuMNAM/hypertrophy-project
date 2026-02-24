import {Hono} from "hono";
import cycle from "./api/mesoCycle/create";
import {cors} from "hono/cors";

//@learned: if i put <Env>() the c: any error is fixed
const app = new Hono<Env>();
app.use(cors())
//testing the api route 

app.get("/home", (c)=>{
	return c.json({message: "the /home route is working "})
})

//@learned: because of not exproting this when i run "npx wrangler dev" it was causing problem to ₹run it locally 


app.route("/api/v1/mesoCycle", cycle);
export default app;