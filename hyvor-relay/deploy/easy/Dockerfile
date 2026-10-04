FROM hyvor/relay:latest

COPY ProjectController.php /app/backend/src/Api/Sudo/Controller/ProjectController.php
COPY ServerIp.php /app/backend/src/Service/Ip/ServerIp.php
COPY LocalController.php /app/backend/src/Api/Local/Controller/LocalController.php
COPY worker /app/worker

COPY migrations/Version20260505100305.php /app/backend/migrations/Version20260505100305.php

COPY Caddyfile /etc/caddy/Caddyfile

COPY localhost.crt /usr/local/share/ca-certificates/localhost.crt
RUN update-ca-certificates

COPY IpAddress.php /app/backend/src/Entity/IpAddress.php
COPY Send.php /app/backend/src/Entity/Send.php
COPY SendService.php /app/backend/src/Service/Send/SendService.php

COPY src/Entity/WarmupSchedule.php /app/backend/src/Entity/WarmupSchedule.php
COPY src/Entity/Type/WarmupStatus.php /app/backend/src/Entity/Type/WarmupStatus.php
COPY src/Service/Ip/IpSelector.php /app/backend/src/Service/Ip/IpSelector.php

RUN composer dump-autoload --no-scripts --optimize
