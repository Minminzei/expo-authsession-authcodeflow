FROM amazonlinux:2

WORKDIR /app

# yum update & install
RUN amazon-linux-extras install -y epel && \
  yum update -y && \
  curl -sL https://rpm.nodesource.com/setup_14.x | bash - && \
  yum install -y nodejs  && \
  npm install -g yarn && \
  rm -rf /var/cache/yum