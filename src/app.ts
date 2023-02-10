import { createStaffingAppInstance } from "./server";

async function init() {
  const [app, scaffold] = await createStaffingAppInstance();
  const port = Number(process.env.PORT) ?? 3000

  await scaffold.createDatabase();

  app.listen(port, () => {
    console.log("Scaffold Started");
  });
}

init();
