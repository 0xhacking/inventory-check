# -*- coding: utf-8 -*-
import os
import json
import time
from fabric.api import *
from fabric.utils import *
from fabric.operations import local
from fabric.decorators import hosts


#
# Fabric script to publish the Squared admin web client to the web server.
# The script will connect to the web server. It will create a new directory
# under the /var/www/html/virtuals folder for the build. It will then
# create a new soft link for the wx2-admin-web-client to the build folder.
#
# Note:
# To get fabric to work with .ssh/config with proxycommand and netcat,
# such as our jump/bastion hosts for deployment, watch out for known
# issues.
#
# https://github.com/fabric/fabric/issues/1020
#
# Fabric 1.7.0
# Paramiko 1.11.1
#

# Leverage the ssh config of the local machine.
env.use_ssh_config = True


# Extract build num from file name.
def get_build(gz_file):
  tokens = os.path.basename(gz_file).split('.')
  if len(tokens) != 4:
    abort('Expected to find build number in gz file \'%s\'.' % gz_file)
  return tokens[1]


# Publish the site by pushing the gz file to the server, explode it, and
# change the soft link to latest folder.
@task
def publish():
  # Put the tar there...
  results = put(local_path='*.gz', remote_path='/tmp', use_sudo=False)
  if results.failed:
    abort('Could not upload the files.')
  if len(results) != 1:
    abort('Uploaded more files than anticipated.')
  gz_file = results[0]

  # Make the target dir...
  parent_dir = '/var/www/virtuals/wxadminweb-versions'
  target_dir = '%s/wxadminweb-v%s' % (parent_dir, get_build(gz_file))
  results = run('mkdir -p %s' % target_dir)
  if results.failed:
    abort('Could not mkdir \'%s.\'' % target_dir)
  results = run('chmod 775 %s' % target_dir)
  if results.failed:
    abort('Could not chmod \'%s.\'' % target_dir)

  # Explode the tar there without the dist/ prefix...
  with cd(target_dir):
    results = run('tar --strip-components=1 -pxvf %s' % gz_file)
    if results.failed:
      abort('Could not extract tar \'%s.\'' % gz_file)

  # Softlink latest...
  with cd('/var/www/virtuals/wxadminweb-versions'):
    results = run('rm -f wxadminweb; ln -sf %s wxadminweb' % os.path.basename(target_dir))
    if results.failed:
      abort('Could not extract tar \'%s.\'' % gz_file)

    # Keep only the last 10 builds
    run('ls -dt */ | tail -n +12 | xargs rm -rf')

    # Do you see what I see...
    run('ls -l wxadminweb/')

  # Delete the tar.
  results = run('rm -f %s' % gz_file, timeout=60)
  if results.failed:
    abort('Could not remove the tar \'%s.\'' % gz_file)


# Publish the site by pushing the gz file to the server, explode it, and
# change the soft link to latest folder.
@task
def publish_int():
  # Put the tar there...
  results = put(local_path='*.gz', remote_path='/tmp', use_sudo=False)
  if results.failed:
    abort('Could not upload the files.')
  if len(results) != 1:
    abort('Uploaded more files than anticipated.')
  gz_file = results[0]

  # Make the target dir...
  parent_dir = '/var/www/virtuals/wxadminweb-int-versions'
  target_dir = '%s/wxadminweb-v%s' % (parent_dir, get_build(gz_file))
  results = run('mkdir -p %s' % target_dir)
  if results.failed:
    abort('Could not mkdir \'%s.\'' % target_dir)
  results = run('chmod 775 %s' % target_dir)
  if results.failed:
    abort('Could not chmod \'%s.\'' % target_dir)

  # Explode the tar there without the dist/ prefix...
  with cd(target_dir):
    results = run('tar --strip-components=1 -pxvf %s' % gz_file)
    if results.failed:
      abort('Could not extract tar \'%s.\'' % gz_file)

  # Softlink latest...
  with cd('/var/www/virtuals/wxadminweb-int-versions'):
    results = run('rm -f wxadminweb; ln -sf %s wxadminweb' % os.path.basename(target_dir))
    if results.failed:
      abort('Could not extract tar \'%s.\'' % gz_file)

    # Keep only the last 10 builds
    run('ls -dt */ | tail -n +12 | xargs rm -rf')

    # Do you see what I see...
    run('ls -l wxadminweb/')

  # Delete the tar.
  results = run('rm -f %s' % gz_file, timeout=60)
  if results.failed:
    abort('Could not remove the tar \'%s.\'' % gz_file)


# Publish the development site similar to the users prod site.
@task
@hosts('localhost')
def publish_to_stackstorm(ss_userid, ss_password, ss_url, name='', vhost_path='', content_path='', vhost_blob_url='',
                          content_blob_url='', folder='', source='', softlink='', servicelevel=''):
  manifest_json = (
    "{\"name\": \"%s\",\"vhost_path\": \"%s\",\"content_path\": \"%s\",\"vhost_blob_url\": \"%s\",\"content_blob_url\": \"%s\",\"extra_actions\": \"{\\\"softlink\\\":[\\\"%s\\\",\\\"%s\\\",\\\"%s\\\"]}\"}" % (
      name, vhost_path, content_path, vhost_blob_url, content_blob_url, folder, source, softlink))

  print_now('Updating downloads services for {0}...'.format(name))
  with settings(hide('running'), show('stdout')):
    response = publish_to_ss(manifest_json, ss_userid, ss_password, ss_url, servicelevel)
  if response is True:
    print_now("Content updated for {0}.".format(name))
    exit(0)
  else:
    print_now("Error updating the content for {0}.  Please check StackStorm".format(name))
    exit(1)


def publish_to_ss(manifest_json, ss_userid, ss_password, ss_url, servicelevel):
  data = {"action": 'sqplatform.service.downloads.update_content',
          "parameters": {"manifest_json": manifest_json,
                         "servicelevel": servicelevel}
          }

  auth_token = get_ss_authtoken(ss_userid, ss_password, ss_url)
  if auth_token is None:
    print 'auth_token could not be attained.'
    exit(1)

  return_code = 0
  cmd_tmpl = ('curl '
              '-H "Content-Type: application/json" '
              '-H "X-Auth-Token: {0}" '
              '-X POST '
              '-d \'{1}\' '
              '{2}:9101/v1/executions')
  cmd = cmd_tmpl.format(auth_token, json.dumps(data), ss_url)
  result = local(cmd, capture=True)
  if result.succeeded:
    result_json = json.loads(result)
    status = check_status(auth_token, ss_url, result_json['id'])
    return status


def print_now(message, show_prefix=False):
  """
  Prints message immediately to stdout
  """
  puts(message, flush=True, show_prefix=show_prefix)


def get_exec_metadata(token, url, exec_id):
  """Returns JSONified metadata of desired execution
  Passes token to url along with exec_id of desired execution
  """
  cmd_tmpl = ('curl '
              '-H "Content-Type: application/json" '
              '-H "X-Auth-Token: {0}" '
              '-X GET '
              '{1}:9101/v1/executions/{2}')
  cmd = cmd_tmpl.format(token, url, exec_id)
  with settings(warn_only=True):
    result = local(cmd, capture=True)
  return json.loads(result)


def get_exec_status(token, url, exec_id):
  """Returns (str) indicating status of execution
  Passes token to url along with exec_id of execution to get current
  status
  """
  return get_exec_metadata(token, url, exec_id)['status']


def check_status(token, url, exec_id):
  """Returns (bool) True if all required SS executions succeed
  Passes token to url along with exec_id to see if workflow succeeds.
  """
  timeout = 15
  interval = 30

  # Wait for StackStorm to finish
  status = get_exec_status(token, url, exec_id)
  while not status == 'succeeded':
    print_now('StackStorm update of downloads service running...')
    if status == 'failed':
      print_now(
        'StackStorm update of downloads service seems to have failed. Verify with execution ID of {}'.format(exec_id))
      return False
    status = get_exec_status(token, url, exec_id)
    time.sleep(interval)
  print_now('StackStorm update of downloads has completed.')
  return True


def get_ss_authtoken(ss_userid, ss_password, url):
  """Returns (str) auth token, None if response is different than expected
  Retrieves an SS auth token.  Takes in a SS userid and password and
  requests an auth token from url.
  """
  with hide('everything'):
    cmd_tmpl = ('curl '
                '-X POST '
                '-u {0}:{1} '
                'http://{2}:9100/tokens')
    auth_token_cmd = cmd_tmpl.format(ss_userid, ss_password, url)
    output = local(auth_token_cmd, capture=True)
    json_output = json.loads(output)

  try:
    return json_output['token']
  except KeyError:
    return None


@task(default='true')
def usage():
  print
  print "Usage: fab [task]"
  print
  print "Run fab --list to see list of tasks."
