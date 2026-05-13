import {Hono} from "hono";
import { encodeJwt, decodeJwt } from "./utils/jwt";
import cycle from "./api/mesoCycle/create";
import {cors} from "hono/cors";
import volumeRoute from "./api/mesoCycle/Week/Volume/volume";
import sessionRoute from "./api/mesoCycle/Session/route";
import frequencyroute from "./api/mesoCycle/Frequency/frequency";
import weekProgressionRoute from "./api/mesoCycle/Week/route";
//@learned: if i put <Env>() the c: any error is fixed
const app = new Hono();
app.use(cors())
//testing the api route 

app.get("/home", async (c)=>{
	
	const payload = {
		userID: 123,
	}
	const jwtToken = await encodeJwt(c.env.JWT_TOKEN, payload)
	
	return c.json({
		message: "the /home route is working ",
		token: jwtToken
	})
})
app.get("/tokenverify", async (c)=>{
	const token = c.req.header("Authorization")?.split(" ")[1]
	const decodedToken = await decodeJwt(token, c.env.JWT_TOKEN)
	return c.json({
		"decodedtoken": decodedToken
	})
})


//@learned: because of not exproting this when i run "npx wrangler dev" it was causing problem to ₹run it locally 
app.route("api/v1/mesoCycle/session", sessionRoute)
app.route("/api/v1/mesoCycle/volume", volumeRoute)
app.route("/api/v1/mesoCycle/frequency", frequencyroute)
app.route("/api/v1/mesoCycle/week", weekProgressionRoute)
app.route("/api/v1/mesoCycle", cycle);
export default app;
