Travis.Views.Build.Build = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, 'attachTo', 'buildSelected', 'buildConfigured', 'updateTab');
    _.extend(this, this.options);

    this.el = $('<div></div>');
    if(this.repository) {
      this.render();
      this.attachTo(this.repository);
    }
  },
  render: function() {
    if(this.repository) this._update();
    return this;
  },
  detach: function() {
    if(this.repository) {
      this.repository.builds.unbind('select', this.buildSelected);
      delete this.repository;
      delete this.build;
    }
  },
  attachTo: function(repository) {
    this.detach();
    this.repository = repository;
    this.repository.builds.bind('select', this.buildSelected);
    this._update();
    this.updateTab();
  },
  detachFromBuild: function() {
    if(this.build) {
      this.build.unbind('configured', this.buildConfigured);
    }
  },
  attachToBuild: function(build) {
    this.build = build;
    this.detachFromBuild();
    this.build.bind('configured', this.buildConfigured);
  },
  buildSelected: function(build) {
    this.attachToBuild(build);
    this._update();
    this.updateTab();
  },
  buildConfigured: function(build) {
    this.build = build;
    this._update();
  },
  updateTab: function() {
    if(this.build) {
      $('#tab_build h5 a').attr('href', '#!/' + this.repository.get('slug') + '/builds/' + this.build.id).html('Build ' + this.build.get('number'));
      $('#tab_parent').hide();
      this.build.parent(function(parent) {
        $('#tab_parent').show().find('h5 a').attr('href', '#!/' + parent.repository.get('slug') + '/builds/' + parent.id).html('Build ' + parent.get('number'));
      });
    }
  },
  _update: function() {
    if(this.build) {
      this.el.empty();
      this._renderSummary();
      if (this.build.matrix) {
          this._renderMatrix();
      } else {
        this._renderLog();
        this._initializeEvents();
        this._activateCurrentLine();
      }
    }
  },
  _renderSummary: function() {
    this.el.append(new Travis.Views.Build.Summary({ model: this.build, parent: this }).render().el);
  },
  _renderLog: function() {
    this.el.append(new Travis.Views.Build.Log({ model: this.build, parent: this }).render().el);
  },
  _initializeEvents: function() {
    var self = this
    _.each(this.el.find('p.line'), function(el) {
      $(el).click(function(){
        var e = self.parent.parent.parent.path_elements;
        // TODO: CREATE PATH HELPERS??
        // Why haven't I done it through anchor + tag? B/c i hate element like that:
        //     <a href="/#!/josevalim/enginex/L31" name="#!/josevalim/enginex/L31">LINE CONTENTS</a>.
        // I think it's easier to create event once here than do it through native anchors.
        window.location.href = [ "#!/", e.owner, "/", e.name, "/L", $(el).attr('name').replace('line', '') ].join('')
      })
    })
  },
  _activateCurrentLine: function() {
    if(this.getLogLineNumber()) {
      var line_element = this.el.find("p[name='line" + this.getLogLineNumber()  + "']")
      $(window).scrollTop(line_element.offset().top)
      line_element.addClass("highlight")
    }
  },
  getLogLineNumber: function () {
    if(this.parent && this.parent.parent)
      return this.parent.parent.parent.path_elements.line_number;
    else
      return null;
  },
  _renderMatrix: function() {
    this.el.append(new Travis.Views.Build.Matrix.Table({ builds: this.build.matrix }).render().el);
  },
});
