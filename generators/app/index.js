'use strict';

const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(yosay(`Welcome to the ${chalk.red('generator-cowellness')} generator!`));

    const prompts = [
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name',
        default: 'Cowellness Service'
      },
      {
        type: 'input',
        name: 'projectDescription',
        message: 'Project description'
      },
      {
        type: 'input',
        name: 'projectVersion',
        message: 'Project version',
        default: '1.0.0'
      },
      {
        type: 'input',
        name: 'authorName',
        message: 'Author name'
      },
      {
        type: 'checkbox',
        name: 'services',
        message: 'Select the services you need in your project:',
        choices: [
          { name: 'fastify', value: 'fastify', checked: false },
          { name: 'redis', value: 'redis', checked: false },
          { name: 'rabbitmq', value: 'rabbitmq', checked: false },
          { name: 'mongoose', value: 'mongoose', checked: false },
          { name: 'elasticSearch', value: 'es', checked: false }
        ]
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    this.fs.copy(
      this.templatePath('cowellness-service'),
      this.destinationPath(this.props.projectName)
    );

    this.fs.copy(
      this.templatePath('cowellness-service/.*'),
      this.destinationPath(this.props.projectName)
    );

    const pkgJson = {
      name: this.props.projectName,
      version: this.props.projectVersion,
      description: this.props.projectDescription,
      author: this.props.authorName
    };

    pkgJson.dependencies = {};
    pkgJson.repository = {
      url: 'git@gitlab.com:cowellness/iseo/' + this.props.projectName + '.git'
    };
    this.props.services.forEach(e => {
      switch (e) {
        case 'fastify':
          pkgJson.dependencies.fastify = '^3.2.1';
          pkgJson.dependencies.jsend = '^1.1.0';
          pkgJson.dependencies['fastify-cookie'] = '^4.0.2';
          pkgJson.dependencies['fastify-swagger'] = '^3.3.0';
          break;
        case 'redis':
          pkgJson.dependencies.ioredis = '^4.17.3';
          pkgJson.dependencies['redis-json'] = '^4.1.0';
          break;
        case 'rabbitmq':
          pkgJson.dependencies.amqplib = '^0.6.0';
          break;
        case 'mongoose':
          pkgJson.dependencies.mongoose = '^5.10.2';
          break;
        case 'es':
          pkgJson.dependencies.elasticsearch = '^16.7.1';
          break;
        default:
          pkgJson.dependencies[e.name] = '^1.0.0';
          console.log('No package available for : ' + e.name);
          break;
      }
    });

    this.fs.extendJSON(
      this.destinationPath('./' + this.props.projectName + '/package.json'),
      pkgJson
    );
  }

  install() {
    this.destinationRoot('./' + this.props.projectName);
    this.installDependencies({
      npm: true,
      bower: false,
      yarn: false
    });
  }
};
