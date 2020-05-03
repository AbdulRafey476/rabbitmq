# Instruction

Please create .env file with these variables below

BASE_URL = http://localhost:2652/


PORT = 2652


DB_HOST = test.com

DB_USER = test

DB_PASSWORD = test

DB_NAME = rabbitmq

DB_PORT = 3306

# Tables
### Tbl_bill_pay

trackingId

errorCode

errorDes

retryAllowed

retryCount

status

### Tbl_retry_log

trackingId

success

retryTime
