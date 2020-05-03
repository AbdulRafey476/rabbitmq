# {RabbitMq} #

### Information ####
* Bill payment service

### Technical information ###

* Run "npm i"
* Create .env file with these variables below
    - BASE_URL = http://localhost:2652/
    - PORT = 2652
    - DB_HOST = test.com
    - DB_USER = test
    - DB_PASSWORD = test
    - DB_NAME = rabbitmq
    - DB_PORT = 3306

# 
### Tables ###

* Tbl_bill_pay:
    - trackingId
    - errorCode
    - errorDes
    - retryAllowed
    - retryCount
    - status

* Tbl_retry_log:
    - trackingId
    - success
    - retryTime



### Client Link ###
* http://54.166.223.25/rabbitmq_client/

### RabbitMq Dashboard ###
* http://54.166.223.25:15672/

### Apis ###
* (POST) http://54.166.223.25:2652/api/post_billpay - Create Transaction
    - errorCode: 000 OR 666

* (POST) http://54.166.223.25:2652/api/post_billpay?trackingId=1 - Retry Transaction
    - errorCode: 000 OR 666
    - cronjob: true OR false

* (POST) http://54.166.223.25:2652/api/post_process_billpay - Cron job on Rabbit Mq Queues
