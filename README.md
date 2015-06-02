# leaf-cms
A content management system for building and coordinating leafs


### Development

You will first need to do the famous:

`git submodule update --init --recursive`

and for the time being, manually `npm install` the dependency submodules (not that leaf is a child, so `submodules/leafbuilder/submodules/leaf`)

```
cd submodules/leafbuilder
npm install
cd submodules/leaf
npm install
cd ../formsmith
npm install
```

Finally go back to the root directory and run `gulp`. Should work.