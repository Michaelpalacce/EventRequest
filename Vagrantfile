$node = <<-SCRIPT
	sudo yum install -y gcc-c++ make
	sudo curl -sL https://rpm.nodesource.com/setup_12.x | sudo -E bash -
	sudo yum install -y nodejs
SCRIPT

Vagrant.configure("2") do |config|
  config.vm.box = "bento/centos-7"
  config.vm.synced_folder ".", "/vagrant"
  config.vm.provision "shell", inline: $node
end