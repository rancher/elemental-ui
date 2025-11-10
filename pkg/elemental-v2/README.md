# OS Management Extension

Adds support for OS Management to Rancher Manager through Elemental.


Elemental is a software stack enabling a centralized, full cloud-native OS management with Kubernetes.

Cluster Node OSes are built and maintained via container images through the Elemental Toolkit and installed on new hosts using the Elemental CLI.

The Elemental Operator and the Rancher System Agent enable Rancher Manager to fully control Elemental clusters, from the installation and management of the OS on the Nodes to the provisioning of new K3s or RKE2 clusters in a centralized way.

For more details take a look at the documentation regarding [Elemental](https://elemental.docs.rancher.com/).


**IMPORTANT NOTE**: In order to have access to OS Management in Rancher Manager, installation of the Elemental Operator is required. Instructions for installing it can be found [here](https://elemental.docs.rancher.com/quickstart-cli#install-elemental-operator).