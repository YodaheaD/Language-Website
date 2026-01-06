## Deploying to our B1s Small VM

Our Azure VM is set up with a B1s Small instance. To deploy our application to this VM, follow these steps:
Keep in mind no routes can have dynamic parameters when exporting a static site with Next.js, double check using npm run build before proceeding.

---

### 1. Make sure next config is set to static export
   In your `next.config.js` file, ensure that the output is set to 'export':

```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  /* config options here */
  output: "export", // <-- tells Next.js to build a static export
};
export default nextConfig;
```

### 2. Move the .out folder to the VM, also create the .env in the VM

- I use winSCP, Ill ssh into the VM, and place the .out folder in /var/www/nextjs-app/out

### 3. Make sure Nginx is installed on the VM, and configure it to serve the static files from the .out folder.

- conf should look like this:

```nginx
server {
    listen 80;
    server_name <VM_IP_ADDRESS>;

    root /var/www/nextjs-app/out;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}

```
### 4. Restart Nginx to apply the changes:

```bash
sudo systemctl restart nginx
```

### 5. Access your application via the VM's public IP address in a web browser.
- Address should be http://<VM_IP_ADDRESS>
 