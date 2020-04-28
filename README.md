# openshift-kube-vip-ansible for OpenShift 3.11

This Ansible playbook provides an bootstrap mechanismus for [https://kube-vip.io](https://kube-vip.io).

## Overview

Kube-vip provides an easy to manage VIP/LoadBalancer for the control plane based on the [Raft consensus algorithm](https://en.wikipedia.org/wiki/Raft_(computer_science). It is configured as Kubernetes static pod, so there is no recursive dependency to the control plane needs to be up.

Because kube-vip is running on the control plane/master nodes, there are no additional load balancer hosts required.

Requirements:
* OpenShift 3.11
* Anible (Tested on version 2.8.5)
* kube-vip >= 0.1.5

## Variables

* `kube_vip_vip`: Virtual IPv4 address for the control plane (required)

* `kube_vip_port`: Port for the kube-vip cluster communication.
  Default: 10000

* `kube_vip_gratuitous_arp`: Sends out gratuitous arp packages to inform
  all neighbor about an IP failover. Default: false

## Preparation

In OpenShift 3.11 the API Server does listen on port 8443. When kube-vip is running beside the API Server on the masters,
there is a port conflict, without a reconfiguration.

### Reconfigure OpenShift API Server not listening on all interfaces

The OpenShift API Server does listen on 0.0.0.0:8433 by default. To prevent the API Server listen on the VIP, the masters needs to be reconfigured first.

Add to the Ansible inventory, often found in `/etc/ansible/hosts`, to take the IPv4 default address collected by Ansible:
```
[OSEv3:vars]
openshift_master_bind_addr="{{ ansible_default_ipv4.address }}"
```

And rerun the master config playbook to rewrite the config file `/etc/origin/master/master-config.yaml`:
```
ansible-playbook playbooks/openshift-master/config.yml
```

Restart all API Server to just listen on the default IP. So enter the command `master-restart api` in sequence on all masters.

## Usage

The Ansible hosts group masters is used, usually defined for openshift-ansible anyway.

`ansible-playbook playbooks/bootstrap.yaml`

## Remarks

* IPv6: kube-vip does currently not support IPv6, so currently no
* OpenShift 4/Kubernetes: Not prepared, as the static pod path have been changed from `/etc/origin/node/pods` to the Kubernetes default of `/etc/kubernetes/manifests` and the API port has changed from 8443 to 6443. I'm not sure, if Ansible is the right way to configure anyway.
