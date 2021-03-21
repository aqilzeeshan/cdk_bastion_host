import * as cdk from '@aws-cdk/core';
//import {} from '@aws-cdk/aws-ec2'
import * as ec2 from '@aws-cdk/aws-ec2';
import * as s3 from '@aws-cdk/aws-s3';
import { hostname } from 'os';

export class CdkBastionStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const vpc = new ec2.Vpc(this, 'VpcFromCDK', {
      cidr: '10.0.0.0/16', 
    });

    /**
     * VPC endpoints
       A VPC endpoint enables you to privately connect your VPC to supported AWS services and VPC endpoint services powered by PrivateLink without requiring an internet gateway, NAT device, VPN connection, or AWS Direct Connect connection. Instances in your VPC do not require public IP addresses to communicate with resources in the service. Traffic between your VPC and the other service does not leave the Amazon network.
       Endpoints are virtual devices. They are horizontally scaled, redundant, and highly available VPC components that allow communication between instances in your VPC and services without imposing availability risks or bandwidth constraints on your network traffic.
       Check this to see how to add VPC endpoints https://docs.aws.amazon.com/cdk/api/latest/docs/aws-ec2-readme.html
       Check how to customize the endpoint policy
    */
    vpc.addGatewayEndpoint('s3-gateway',{
      service:ec2.GatewayVpcEndpointAwsService.S3
    })

    //You can also add multiple flow logs with different destinations.
    const bucket = new s3.Bucket(this, 'MyCustomBucket');
    vpc.addFlowLog('FlowLogS3', {
      destination: ec2.FlowLogDestination.toS3(bucket)
    });
    
    vpc.addFlowLog('FlowLogCloudWatch', {
      trafficType: ec2.FlowLogTrafficType.REJECT
    });

    /**
     * A bastion host functions as an instance used to access servers and resources in a VPC without open up the complete VPC on a network level. You can use bastion hosts using a standard SSH connection targeting port 22 on the host. As an alternative, you can connect the SSH connection feature of AWS Systems Manager Session Manager, which does not need an opened security group.
     */
    //A default bastion host for use via SSM can be configured like:
    const host_bastion = new ec2.BastionHostLinux(this, 'BastionHost', { 
      vpc: vpc,
      instanceType: new ec2.InstanceType('t3.micro'),
    });
    /**
     * If you want to connect from the internet using SSH, you need to place the host into a public subnet. You can then configure allowed source hosts.
     *     const host = new ec2.BastionHostLinux(this, 'BastionHost', {
                  vpc,
                  subnetSelection: { subnetType: ec2.SubnetType.PUBLIC },
            });
            host.allowSshAccessFrom(ec2.Peer.ipv4('1.2.3.4/32'));
     */

      new cdk.CfnOutput(this, 'InstanceID', { value: host_bastion.instanceId });

      //install cli plugin from http://docs.aws.amazon.com/console/systems-manager/session-manager-plugin-not-found
      //connect using ssm 
      //aws ssm start-session --target i-0524b461bfdcf821f --region=us-east-1

      /**
       * ////////////////////////////////////////////////////////////////////////////////////////
       * Create Webserver in Public Subnet
       */

      const webserverSecurityGroup = new ec2.SecurityGroup(this,"SecurityGroup",{
        vpc:vpc,
        description:"SecurityGroup from CDK",
        securityGroupName:"CDK SecurityGroup",
        allowAllOutbound:true
      })
      //Allow ssh from VPC
      webserverSecurityGroup.addIngressRule(ec2.Peer.ipv4('10.0.0.0/16'),ec2.Port.tcp(22),"Allow ssh access from the VPC")
      //Allow ssh from anywhere in the world
      //mySecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow ssh access from the world');
      
      //allow requests from any IP to port 80
      webserverSecurityGroup.addIngressRule(
        ec2.Peer.anyIpv4(), 
        ec2.Port.tcp(80), 
        'allow ingress http traffic'                                                                                                                                                     
      )


      //as per https://github.com/aws/aws-cdk/issues/12848
      const subnetSelection : ec2.SubnetSelection = {
        subnetType:ec2.SubnetType.PUBLIC
      };

      //setup web instance in public subnet
      const webServer = new ec2.Instance(this, "WebInstance",{
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
        machineImage: new ec2.AmazonLinuxImage(),
        vpc: vpc,
        securityGroup:webserverSecurityGroup,
        vpcSubnets:subnetSelection
      })
    
  }
}
