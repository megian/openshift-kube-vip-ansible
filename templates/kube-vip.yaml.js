apiVersion: v1
kind: Pod
metadata:
  name: kube-vip
  namespace: kube-system
spec:
  containers:
  - args:
    - start
    - -c
    - /etc/kube-vip/config.yaml
    image: ghcr.io/kube-vip/kube-vip:v0.3.9
    name: kube-vip
    securityContext:
      capabilities:
        add:
        - NET_ADMIN
        - SYS_TIME
    volumeMounts:
    - mountPath: /etc/kube-vip/
      name: config
  hostNetwork: true
  priorityClassName: system-node-critical
  volumes:
  - hostPath:
      path: /etc/kube-vip/
    name: config
