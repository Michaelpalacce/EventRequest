def notifyBuild(String buildStatus = 'STARTED') {
  // build status of null means successful
  buildStatus =  buildStatus ?: 'SUCCESSFUL'

  emailext (
      subject: "${buildStatus}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
      to: '$DEFAULT_RECIPIENTS',
      body: """
Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':

Check console output at "${env.JENKINS_URL}job/${env.JOB_NAME}/${env.BUILD_NUMBER}"
"""
    )
}
def notifyFailed() {
  emailext (
      subject: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
      to: '$DEFAULT_RECIPIENTS',
      body: """
FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':

Check console output at "${env.JENKINS_URL}job/${env.JOB_NAME}/${env.BUILD_NUMBER}"
"""
    )
}
def notifySuccessful() {
  emailext (
      subject: "SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
      to:'$DEFAULT_RECIPIENTS',
      body: """
SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':

Check console output at "${env.JENKINS_URL}job/${env.JOB_NAME}/${env.BUILD_NUMBER}"
"""
    )
}

pipeline {
	agent none
	parameters {
		booleanParam(name: 'publish', defaultValue: false, description: 'Do you want to publish to npm?')
		booleanParam(name: 'build16', defaultValue: true, description: 'Do you want to build the project on NodeJS 16?')
		booleanParam(name: 'build14', defaultValue: true, description: 'Do you want to build the project on NodeJS 16?')
		booleanParam(name: 'build12', defaultValue: true, description: 'Do you want to build the project on NodeJS 16?')
	}

	post{
		failure{
			notifyBuild("FAILED")
		}
		success{
			notifySuccessful()
		}
	}

	stages {
		stage( 'NodeJS-16 Tests') {
		    when {
		        beforeAgent true;
		        expression{
		            return build16.toBoolean()
		        }
		    }
			agent { label 'nodejs-16' }
			steps {
				sh """
					npm ci
					node test.js --silent
				"""
			}
		}

		stage( 'NodeJS-14 Tests' ) {
			when {
				beforeAgent true;
				expression{
					return build14.toBoolean()
				}
			}
			agent { label 'nodejs-14' }
			steps {
				sh """
					npm ci
					node test.js --silent
				"""
			}
		}

		stage( 'NodeJS-12 Tests' ) {
			when {
				beforeAgent true;
				expression{
					return build12.toBoolean()
				}
			}
			agent { label 'nodejs-12' }
			steps {
				sh """
					npm ci
					node test.js --silent
				"""
			}
		}

		stage( 'NodeJS-16 commit' ) {
			when {
				beforeAgent true;
				expression{
					return publish.toBoolean()
				}
			}
			agent { label 'nodejs-16' }
			steps {
				script {
					withCredentials([string(credentialsId: 'npm-access-token', variable: 'NPMTOKEN')]) {
						sh """
							echo "//registry.npmjs.org/:_authToken=$NPMTOKEN" >> ~/.npmrc
							npm publish
						"""
					}
				}
			}
		}
	}
}