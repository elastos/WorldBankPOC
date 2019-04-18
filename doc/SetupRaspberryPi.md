# Setup raspberry pi Rasbian lite using command line. headless

## Download rasbian image and burn into micro SD card

## Enable ssh before insert sd card into raspberry pi

When the sd card still in Macbook slot run
```
touch /path/to/boot/partition/ssh
```

a empty file called "ssh" will be created, so that the pi will allow ssh connection

## If you have existing ssh key but need to refresh
```
ssh-keygen -R <host>
```

## Setup wifi password before insert sd card to RPi

While the sd card still inside Macbook slot
edit the file 
```
wpa_supplicant.conf  =>
 country=us
update_config=1
ctrl_interface=/var/run/wpa_supplicant

network={
 scan_ssid=1
 ssid="MyNetworkSSID"
 psk="Pa55w0rd1234"
}
```

This will allow the RPi start with the above ssid and passkey.

# Install docker to raspberry pie

## install docker engine

From
https://medium.freecodecamp.org/the-easy-way-to-set-up-docker-on-a-raspberry-pi-7d24ced073ef

`curl -fsSL get.docker.com -o get-docker.sh && sh get-docker.sh`


## test installing using

`docker run hello-world`

## Running docker-compose in a docker container without build it

```
docker run \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v "$PWD:/rootfs/$PWD" \
    -w="/rootfs/$PWD" \
    docker/compose:1.13.0 up
```

make an alias will help launch

```
echo alias docker-compose="'"'docker run \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v "$PWD:/rootfs/$PWD" \
    -w="/rootfs/$PWD" \
    docker/compose:1.13.0'"'" >> ~/.bashrc

```

then just reboot the shell
```
source ~/.bashrc
```

# Install Zymbit SDK API 

## install Zymbit SDK
```
curl -G https://s3.amazonaws.com/zk-sw-repo/install_zk_sw.sh | sudo bash
```


## Test Zymbit installation, Try API

python /usr/local/share/zymkey/examples/zk_app_utils_test.py
python /usr/local/share/zymkey/examples/zk_crypto_test.py

# How RPi with Zymbit Luks dm-crypt boot


Different types of rootkits load during different phases of the startup process:
* Firmware rootkits. These kits overwrite the firmware of the PC’s basic input/output system or other hardware so the rootkit can start before Windows.
* Bootkits. These kits replace the operating system’s bootloader (the small piece of software that starts the operating system) so that the PC loads the bootkit before the operating system.
* Kernel rootkits. These kits replace a portion of the operating system kernel so the rootkit can start automatically when the operating system loads.
* Driver rootkits. These kits pretend to be one of the trusted drivers that Windows uses to communicate with the PC hardware.
The countermeasures
Windows 10 supports four features to help prevent rootkits and bootkits from loading during the startup process:
* Secure Boot. PCs with UEFI firmware and a Trusted Platform Module (TPM) can be configured to load only trusted operating system bootloaders.
* Trusted Boot. Windows checks the integrity of every component of the startup process before loading it.
* Early Launch Anti-Malware (ELAM). ELAM tests all drivers before they load and prevents unapproved drivers from loading.
* Measured Boot. The PC’s firmware logs the boot process, and Windows can send it to a trusted server that can objectively assess the PC’s health.

# tmp-js an example of remote attestation framework

remote attestation protocol https://google.github.io/tpm-js/#pg_attestation

TPM is a discrete device soldered on the motherboard. It is a cheap (costs less than a dollar to manufacture), low-end device that communicates with the main CPU over a slow, low-bandwidth channel.
TPM is a passive device: it doesn't monitor the system and it can't halt CPU execution. For it to work, it must be fed data.
TPM has limited storage for runtime state and persistent data: its non-volatile storage is about 64KB in size. TPM can only hold a limited number of objects at the same time. For this reason, a dedicated software layer on the host (resource manager) loads and unloads session objects at runtime.
TPM command execution is single-threaded: it executes one command at a time. Commands cannot be queued or batched together - each command must wait for the currently running command to finish. Note that command execution can be canceled.


# Raspberry Pi as PXE server

https://elinux.org/R-Pi_PXE_Server
