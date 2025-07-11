const http = require("http");

function testAdminPage() {
  return new Promise((resolve, reject) => {
    const req = http.get("http://localhost:3000/admin", (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log("Status Code:", res.statusCode);
        console.log("Headers:", res.headers);

        if (res.statusCode === 200) {
          if (data.includes("System Administration")) {
            console.log(
              "✅ Admin page loads successfully with correct content",
            );
            resolve(true);
          } else {
            console.log("❌ Admin page loads but missing expected content");
            console.log("Response preview:", data.substring(0, 500));
            resolve(false);
          }
        } else {
          console.log("❌ Admin page failed to load. Status:", res.statusCode);
          console.log("Response:", data.substring(0, 500));
          resolve(false);
        }
      });
    });

    req.on("error", (e) => {
      console.log("❌ Request error:", e.message);
      reject(e);
    });

    req.setTimeout(10000, () => {
      console.log("❌ Request timeout");
      req.destroy();
      resolve(false);
    });
  });
}

testAdminPage().catch(console.error);
