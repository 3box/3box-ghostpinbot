/******************************************************************************
  Network

  Creates VPC and then create a private and public subnet in each availability
  zone. Creates internet gateway for public subnets. Create Nat gateways for
  outbound internet traffic to leave private subnets.
*******************************************************************************/

provider "aws" {
  version = "2.22.0"
  region     = "${var.aws_region}"
}

# Get AV zones for given region
data "aws_availability_zones" "available" {}

# Create VPC in region
resource "aws_vpc" "main" {
  cidr_block = "172.17.0.0/16"
  enable_dns_hostnames = true
}

# Private subnets in each availability zone
resource "aws_subnet" "private" {
  count             = "${lookup(var.az_count, terraform.workspace)}"
  cidr_block        = "${cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)}"
  availability_zone = "${data.aws_availability_zones.available.names[count.index]}"
  vpc_id            = "${aws_vpc.main.id}"
}

# Public subnets in each availability zone
resource "aws_subnet" "public" {
  count                   = "${lookup(var.az_count, terraform.workspace)}"
  cidr_block              = "${cidrsubnet(aws_vpc.main.cidr_block, 8, lookup(var.az_count, terraform.workspace) + count.index)}"
  availability_zone       = "${data.aws_availability_zones.available.names[count.index]}"
  vpc_id                  = "${aws_vpc.main.id}"
  map_public_ip_on_launch = true
}

# Create internet gateway for the public subnet
resource "aws_internet_gateway" "gw" {
  vpc_id = "${aws_vpc.main.id}"
}

# Create routing table entry for public subnet traffic through the IGW
resource "aws_route" "internet_access" {
  route_table_id         = "${aws_vpc.main.main_route_table_id}"
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = "${aws_internet_gateway.gw.id}"
}

# Create a NAT gateway with an Elastic IP for each private subnet
resource "aws_eip" "gw" {
  count      = "${lookup(var.az_count, terraform.workspace)}"
  vpc        = true
  depends_on = ["aws_internet_gateway.gw"]
}

resource "aws_nat_gateway" "gw" {
  count         = "${lookup(var.az_count, terraform.workspace)}"
  subnet_id     = "${element(aws_subnet.public.*.id, count.index)}"
  allocation_id = "${element(aws_eip.gw.*.id, count.index)}"
}

# Create a new route table for the private subnets
# And make it route non-local traffic through the NAT gateway to the internet
resource "aws_route_table" "private" {
  count  = "${lookup(var.az_count, terraform.workspace)}"
  vpc_id = "${aws_vpc.main.id}"

  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = "${element(aws_nat_gateway.gw.*.id, count.index)}"
  }
}

# Explicitely associate the newly created route tables to the private subnets (so they don't default to the main route table)
resource "aws_route_table_association" "private" {
  count          = "${lookup(var.az_count, terraform.workspace)}"
  subnet_id      = "${element(aws_subnet.private.*.id, count.index)}"
  route_table_id = "${element(aws_route_table.private.*.id, count.index)}"
}