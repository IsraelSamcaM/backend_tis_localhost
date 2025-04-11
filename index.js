import app from "./src/app.js";
import { sequelize } from "./src/database/database.js";

async function main() {
    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    });
}

main();
