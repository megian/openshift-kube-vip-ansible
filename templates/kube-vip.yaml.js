apiVersion: v1
kind: Pod
metadata:
  name: kube-vip
  namespace: kube-system
spec:
  containers:
  - args:
    - start
{% if kube_vip_config_mode == "file" %}
    - -c
    - /etc/kube-vip/config.yaml
{% endif %}
{% if kube_vip_config_mode == "env" %}
    env:
    - name: vip_localpeer
      value: "{{ inventory_hostname }}:{{ ansible_default_ipv4.address }}:{{ kube_vip_port | default(10000) }}"
    - name: vip_remotepeers
      value: "{% for name in groups.masters | difference(inventory_hostname) %}{{ name }}:{{ hostvars[name].ansible_default_ipv4.address }}:{{ kube_vip_port | default(10000) }}{% if not loop.last %},{% endif %}{% endfor %}"
    - name: vip_address
      value: "{{ kube_vip_vip_address_ipv4 | default('') }}"
    - name: vip_arp
      value: "{{ kube_vip_gratuitous_arp | default('false') }}"
    - name: vip_singenode
      value: "false"
    - name: vip_startleader
      value: "{{ inventory_hostname == groups.masters.0 | ternary('true', 'false') }}"
    - name: vip_interface
      value: "{{ ansible_default_ipv4.interface }}"
    - name: lb_name
      value: "OpenShift Control Plane"
    - name: lb_type
      value: "tcp"
    - name: lb_port
      value: "9443"
    - name: lb_bindtovip
      value: "true"
    - name: lb_backends
      value: "{% for name in [inventory_hostname] + (groups.masters | difference(inventory_hostname)) %}{{ name }}:{{ hostvars[name].ansible_default_ipv4.address }}:8443{% if not loop.last %},{% endif %}{% endfor %}"
{% endif %}
    image: docker.io/plndr/kube-vip:0.1.5
    name: kube-vip
    securityContext:
      capabilities:
        add:
        - NET_ADMIN
        - SYS_TIME
{% if kube_vip_config_mode == "file" %}
    volumeMounts:
    - mountPath: /etc/kube-vip/
      name: config
{% endif %}
  hostNetwork: true
  priorityClassName: system-node-critical
{% if kube_vip_config_mode == "file" %}
  volumes:
  - hostPath:
      path: /etc/kube-vip/
    name: config
{% endif %}
