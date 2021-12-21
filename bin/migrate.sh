#!/bin/sh

#
#
#

FOLDER=$1

if [[ $1 -eq 0 ]] ; then
    echo 'Please specify FOLDER'
    exit 1
fi

echo 'Using directory' $FOLDER
echo

replace() {
  FROM=$( echo $1 | sed 's_/_\\/_g')
  TO=$( echo $2 | sed 's_/_\\/_g')

  echo $1 '=>' $2

  find $FOLDER -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \)  -print0 | xargs -0 -n 1 sed -i '' 's/'$FROM'/'$TO'/g'
}

# import '../module.js' => import '../module'
replace ".js'" "'"

# import '../module.jsx' => import '../module'
replace ".jsx'" "'"

# core/utils => @gostgroup/gp-utils/lib
replace 'core/utils' '@gostgroup/gp-utils/lib'

# core/api/ApiServiceFactory => @gostgroup/gp-api/ApiServiceFactory
replace 'core/api/ApiServiceFactory' '@gostgroup/gp-api/lib/ApiServiceFactory'

# core/api/ws/WebsocketServiceFactory => @gostgroup/gp-api/lib/ws/WebsocketServiceFactory
replace 'core/api/ws/WebsocketServiceFactory' '@gostgroup/gp-api/lib/ws/WebsocketServiceFactory'

# core/api/services => @gostgroup/gp-core/lib/api/services
replace 'core/api/services' '@gostgroup/gp-core/lib/api/services'

# core/api/ws/services => @gostgroup/gp-core/lib/api/ws/services
replace 'core/api/ws/services' '@gostgroup/gp-core/lib/api/ws/services'

# core/api/factories => @gostgroup/gp-core/lib/api/factories
replace 'core/api/factories' '@gostgroup/gp-core/lib/api/factories'

# core/api/ws/factories => @gostgroup/gp-core/lib/api/ws/factories
replace 'core/api/ws/factories' '@gostgroup/gp-core/lib/api/ws/factories'

# core/editor => @gostgroup/gp-constructor/lib
replace 'core/editor' '@gostgroup/gp-constructor/lib'

# core/gistek_forms => @gostgroup/gp-forms/lib
replace 'core/gistek_forms' '@gostgroup/gp-forms/lib'

# core/constants => @gostgroup/gp-core/lib/constants
replace 'core/constants' '@gostgroup/gp-core/lib/constants'

# core/routes => @gostgroup/gp-core/lib/routes
replace 'core/routes' '@gostgroup/gp-core/lib/routes'

# core/components => @gostgroup/gp-core/lib/components
replace 'core/components' '@gostgroup/gp-core/lib/components'

# core/redux/utils => @gostgroup/gp-redux-utils/lib
replace 'core/redux/utils' '@gostgroup/gp-redux-utils/lib'

# core/redux => @gostgroup/gp-core/redux/lib
replace 'core/redux' '@gostgroup/gp-core/redux/lib'

# core/config => @gostgroup/gp-core/lib/config
replace 'core/config' '@gostgroup/gp-core/lib/config'

# core/globals => @gostgroup/gp-core/lib/globals
replace 'core/globals' '@gostgroup/gp-core/lib/globals'

# core/assets => @gostgroup/gp-core/lib/assets
replace 'core/assets' '@gostgroup/gp-core/lib/assets'

exit 1
