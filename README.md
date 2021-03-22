* Shows how to create Bastion host in Private subnet with few lines of code.
* Shows how to connect to Bastion host with Session Manager using AWS CLI
* Shows how to create VPC flowlogs and save in S3
* Shows how to create VPC endpoints to make AWS Services connect to VPC
* Good article `https://mechanicalrock.github.io/2020/07/20/private-bastions.html` and `https://medium.com/faun/create-a-bastion-with-aws-cdk-d5ebfb91aef9`
* For further todo `https://github.com/aws-samples/aws-cdk-examples/blob/c985b879fbed067e615af9c7ee257ef54d939c14/python/ec2-cloudwatch/ec2_cloudwatch/ec2_cloudwatch_stack.py`
# Autoscaling Group
* This is based on `https://levelup.gitconnected.com/implementing-and-testing-aws-ec2-auto-scaling-13db17be1161` and `https://github.com/aws-samples/aws-cdk-examples/blob/master/typescript/application-load-balancer/index.ts`  
* See how to use it to lookup AMI `https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-ec2.LookupMachineImage.html` check example `https://docs.aws.amazon.com/cdk/api/latest/docs/aws-ec2-readme.html`
* Find AMI `https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/finding-an-ami.html`

`aws ec2 describe-images \`      
    `--owners 309956199498 \`     
    `--filters "Name=name,Values=RHEL-7.5_HVM_GA*" "Name=state,Values=available" \`  
    `--query "reverse(sort_by(Images, &CreationDate))[:1].ImageId" \`      
    `--output text`      

change for windows

`aws ec2 describe-images ^`  
    `--owners 099720109477 ^`  
    `--filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-xenial-16.04-amd64-server-????????" "Name=state,Values=available" ^`  
    `--query "reverse(sort_by(Images, &CreationDate))[:1].ImageId" ^`  
    `--output text`  

It returns
`ami-056db1277deef2218`
